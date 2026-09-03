import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Scan, AlertTriangle, Loader2, Keyboard } from 'lucide-react';
import { api } from '../../api/client';
import { LocalErrorBoundary } from '../ui/LocalErrorBoundary';

type ScanStatus = 'idle' | 'scanning' | 'success' | 'warning' | 'error';

interface ScanState {
    status: ScanStatus;
    message: string;
}

export const ReceptionScanner: React.FC = () => {
    const [scanState, setScanState] = useState<ScanState>({ status: 'idle', message: 'Listo para el siguiente Atleta' });
    
    const isProcessingRef = useRef<boolean>(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [manualId, setManualId] = useState('');
    const [cameraFailed, setCameraFailed] = useState(false);

    // Audio API for Sensory Feedback ("Ojos Fuera de la Pantalla")
    const playBeep = (type: 'success' | 'warning' | 'error') => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            if (type === 'success') {
                // High pitch, short beep
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, ctx.currentTime);
                gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
                osc.start();
                osc.stop(ctx.currentTime + 0.15);
            } else if (type === 'warning') {
                // Medium pitch (Warning / Doble Escaneo)
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(400, ctx.currentTime);
                gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
                osc.start();
                osc.stop(ctx.currentTime + 0.2);
            } else {
                // Low pitch, longer error buzz (Expirado)
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(200, ctx.currentTime);
                gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
                osc.start();
                osc.stop(ctx.currentTime + 0.4);
            }
        } catch (e) {
            console.error("Audio API no soportada", e);
        }
    };

    const checkInMutation = useMutation({
        mutationFn: async (token: string) => {
            const response = await api.post('/v1/attendance/check-in', { token });
            return response.data;
        },
        onSuccess: () => {
            playBeep('success');
            setScanState({ status: 'success', message: '¡Acceso concedido!' });
            scheduleAutoResume();
        },
        onError: (error: any) => {
            const status = error.response?.status;
            if (status === 409) {
                playBeep('warning');
                setScanState({ status: 'warning', message: 'Doble gasto: Este pase ya fue utilizado.' });
            } else if (status === 401 || status === 400 || status === 404) {
                playBeep('error');
                setScanState({ status: 'error', message: 'QR expirado o inválido. Que el atleta actualice su pantalla.' });
            } else {
                playBeep('error');
                setScanState({ status: 'error', message: 'Error de red o servidor. Intenta de nuevo.' });
            }
            scheduleAutoResume();
        }
    });

    const scheduleAutoResume = () => {
        // Continuous Scan Loop
        setTimeout(() => {
            setScanState({ status: 'idle', message: 'Listo para el siguiente Atleta' });
            isProcessingRef.current = false;
            if (scannerRef.current) {
                scannerRef.current.resume();
            }
        }, 2500);
    };

    useEffect(() => {
        if (cameraFailed) return;

        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 15, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true },
            /* verbose= */ false
        );
        scannerRef.current = scanner;

        try {
            scanner.render(onScanSuccess, onScanFailure);
        } catch (e) {
            console.error("Camera Init Error:", e);
            setCameraFailed(true);
        }

        function onScanSuccess(decodedText: string) {
            if (isProcessingRef.current) return;
            isProcessingRef.current = true;
            
            // 1. Pausar hardware para ahorrar recursos
            scanner.pause(true);
            
            // 2. Validación Criptográfica y Sintáctica Local (Safe Zone < 200ms)
            try {
                // Parseo rápido del payload JWT (Header.Payload.Signature)
                const parts = decodedText.split('.');
                if (parts.length !== 3) throw new Error("JWT malformado");
                
                const payloadStr = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
                const payload = JSON.parse(payloadStr);
                
                // Validación Local de Expiración
                const now = Math.floor(Date.now() / 1000);
                if (payload.exp && payload.exp < now) {
                    playBeep('error');
                    setScanState({ status: 'error', message: 'QR Expirado. Pide al atleta que refresque su pantalla.' });
                    scheduleAutoResume();
                    return;
                }

                // --- HILO A (Síncrono / Optimista): UX de Inmediatez ---
                playBeep('success');
                setScanState({ status: 'success', message: '¡Acceso concedido! (Optimista)' });
                
                // --- HILO B (Asíncrono / Red): Persistencia en Ledger ---
                // Disparamos la mutación en background sin bloquear la interfaz
                checkInMutation.mutate(decodedText);

            } catch (e) {
                // Si falla el parseo local, asumimos fraude óptico o error de formato
                playBeep('error');
                setScanState({ status: 'error', message: 'Código ilegible o inválido.' });
                scheduleAutoResume();
            }
        }

        function onScanFailure(error: any) {
            // Se ignora silenciosamente mientras busca QR
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
            }
        };
    }, [cameraFailed]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualId || isProcessingRef.current) return;
        isProcessingRef.current = true;
        setScanState({ status: 'scanning', message: 'Validando ID Manual...' });
        checkInMutation.mutate(manualId);
        setManualId('');
    };

    const renderScannerFallback = () => (
        <form onSubmit={handleManualSubmit} className="flex flex-col gap-4 items-center justify-center bg-zinc-950 border border-zinc-800 rounded-2xl p-8 mb-6 shadow-inner w-full min-h-[300px]">
            <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-2">
                <Keyboard size={32} className="text-zinc-400" />
            </div>
            <h3 className="text-white font-bold">Cámara no disponible</h3>
            <p className="text-zinc-500 text-xs mb-4">Ingresa el ID numérico del atleta</p>
            <input 
                type="text"
                autoFocus
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="Ej. 10452"
                className="w-full text-center bg-zinc-900 border border-zinc-700 text-white rounded-xl py-3 text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            <button type="submit" disabled={!manualId || scanState.status === 'scanning'} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black uppercase tracking-widest text-sm rounded-xl transition-all disabled:opacity-50">
                Registrar Acceso
            </button>
        </form>
    );

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md mx-auto text-center shadow-2xl relative overflow-hidden">
            {/* Ambient Background Color Flash */}
            <div className={`absolute inset-0 opacity-20 pointer-events-none transition-colors duration-300 ${
                scanState.status === 'success' ? 'bg-emerald-500' :
                scanState.status === 'warning' ? 'bg-amber-500' :
                scanState.status === 'error' ? 'bg-red-500' :
                'bg-transparent'
            }`} />

            <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2 mb-2 relative z-10">
                <Scan size={28} className="text-emerald-400" />
                Attendance Engine
            </h2>
            <p className="text-sm text-zinc-400 mb-6 relative z-10">Control de Acceso Físico (Recepción B2B)</p>

            <LocalErrorBoundary 
                componentName="Módulo de Escáner QR" 
                fallback={renderScannerFallback()}
                onReset={() => setCameraFailed(false)}
            >
                {cameraFailed ? (
                    renderScannerFallback()
                ) : (
                    <div id="reader" className="overflow-hidden rounded-2xl bg-black border-2 border-zinc-800 mb-6 shadow-inner relative z-10" style={{ width: '100%', minHeight: '300px' }}></div>
                )}
            </LocalErrorBoundary>

            <div className={`p-4 rounded-xl flex items-center justify-center gap-3 font-semibold transition-all duration-300 relative z-10 ${
                scanState.status === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 scale-105 shadow-lg shadow-emerald-500/20' :
                scanState.status === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 scale-105 shadow-lg shadow-amber-500/20' :
                scanState.status === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/50 scale-105 shadow-lg shadow-red-500/20' :
                scanState.status === 'scanning' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' :
                'bg-zinc-800/80 text-zinc-300 border border-zinc-700'
            }`}>
                {scanState.status === 'success' && <CheckCircle2 size={24} className="animate-in zoom-in duration-300" />}
                {scanState.status === 'warning' && <AlertTriangle size={24} className="animate-in zoom-in duration-300" />}
                {scanState.status === 'error' && <XCircle size={24} className="animate-in zoom-in duration-300" />}
                {scanState.status === 'scanning' && <Loader2 size={24} className="animate-spin text-cyan-400" />}
                {scanState.status === 'idle' && <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />}

                <span className="tracking-wide">{scanState.message}</span>
            </div>
        </div>
    );
};

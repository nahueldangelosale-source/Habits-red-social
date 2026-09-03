import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { ScanFace, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../api/client';

interface EphemeralQRProps {
    reservationId: string;
}

interface TokenResponse {
    token: string;
    expires_in: number;
}

export const EphemeralQR: React.FC<EphemeralQRProps> = ({ reservationId }) => {
    // 1. Strict Query Configuration (CTO Directives)
    const { data, error, isLoading, dataUpdatedAt } = useQuery<TokenResponse>({
        queryKey: ['attendanceToken', reservationId],
        queryFn: async () => {
            const response = await api.get(`/v1/attendance/token?reservation_id=${reservationId}`);
            return response.data;
        },
        refetchInterval: 25000,     // Anticipate 5s before 30s expiration
        staleTime: 0,               // Never cache this token, it is ephemeral
        gcTime: 0,                  // Instantly garbage collect
        refetchOnWindowFocus: true, // Battery & Network Optimization: Stop refetching when backgrounded
        retry: 1,                   // Don't retry infinitely on 400/401 errors
    });

    // 2. Visual progress bar (ticks every second)
    const [timeLeft, setTimeLeft] = useState(25);

    useEffect(() => {
        // Reset countdown to 25 every time we get a fresh token
        setTimeLeft(25);
    }, [dataUpdatedAt]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-sm mx-auto text-center flex flex-col items-center gap-4 shadow-xl">
                <Loader2 size={32} className="animate-spin text-cyan-400" />
                <p className="text-zinc-400 text-sm">Asegurando pase criptográfico...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-950/40 border border-red-500/30 rounded-3xl p-6 text-center max-w-sm mx-auto shadow-xl">
                <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
                <h3 className="text-red-400 font-semibold text-sm mb-1">Pase No Disponible</h3>
                <p className="text-red-300/80 text-xs">
                    {(error as any).response?.data?.detail || "Asegúrate de que la reserva esté confirmada o no haya expirado."}
                </p>
            </div>
        );
    }

    const progressPercentage = (timeLeft / 25) * 100;

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 max-w-sm mx-auto text-center overflow-hidden relative shadow-2xl">
            {/* Ambient Background Glow based on QR status */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-cyan-400/10 blur-[70px] pointer-events-none" />

            <h2 className="text-lg font-bold text-white flex items-center justify-center gap-2 mb-1 relative z-10">
                <ScanFace size={20} className="text-cyan-400" />
                Pase de Acceso
            </h2>
            <p className="text-xs text-zinc-400 mb-6 relative z-10">
                Muestra este QR en la recepción para hacer Check-in.
            </p>

            {/* QR Code Container */}
            <div className="bg-white p-4 rounded-2xl mx-auto inline-block shadow-lg relative z-10">
                {data?.token ? (
                    <QRCodeSVG 
                        value={data.token}
                        size={220}
                        level="Q"
                        includeMargin={false}
                        fgColor="#000000"
                        bgColor="#FFFFFF"
                    />
                ) : (
                    <div className="w-[220px] h-[220px] flex items-center justify-center">
                        <AlertCircle className="text-zinc-400" />
                    </div>
                )}
            </div>

            {/* Expire Feedback - Visual Bar */}
            <div className="mt-8 relative z-10">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider mb-2">
                    <span className={timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-zinc-400'}>
                        {timeLeft <= 5 ? 'Expirando...' : 'Código Activo'}
                    </span>
                    <span className={`font-mono ${timeLeft <= 5 ? 'text-red-400' : 'text-cyan-400'}`}>
                        {timeLeft}s
                    </span>
                </div>
                
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5 relative">
                    <div 
                        className={`h-full rounded-full shadow-[0_0_8px_currentColor] transition-all duration-1000 ease-linear ${
                            timeLeft <= 5 ? 'bg-red-400 text-red-400' : 'bg-cyan-400 text-cyan-400'
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
                <p className="text-[9px] text-zinc-500 mt-4 font-mono">
                    Protección anti-fraude activa.<br/>El código rota automáticamente.
                </p>
            </div>
        </div>
    );
};

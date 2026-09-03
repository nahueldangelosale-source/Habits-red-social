import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode.react';

interface RewardClaimQRProps {
    jwtToken: string;
    expiresInSeconds: int;
}

export const RewardClaimQR: React.FC<RewardClaimQRProps> = ({ jwtToken, expiresInSeconds }) => {
    const defaultVal = expiresInSeconds * 1000;
    const [timeLeftMs, setTimeLeftMs] = useState(defaultVal);
    const msRef = useRef<HTMLSpanElement>(null);
    const endMsRef = useRef<number>(Date.now() + defaultVal);

    useEffect(() => {
        let animationFrameId: number;

        // Bucle vital de 60fps para los milisegundos anti-screenshot
        const renderLoop = () => {
            const now = Date.now();
            const remaining = Math.max(0, endMsRef.current - now);
            setTimeLeftMs(remaining);

            if (msRef.current) {
                // Actualizamos directamente el DOM esquivando React state para 60fps reales
                const seconds = Math.floor(remaining / 1000);
                const ms = remaining % 1000;
                msRef.current.textContent = `${seconds.toString().padStart(2, '0')}:${ms.toString().padStart(3, '0')}`;
            }

            if (remaining > 0) {
                animationFrameId = requestAnimationFrame(renderLoop);
            }
        };

        animationFrameId = requestAnimationFrame(renderLoop);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const isExpired = timeLeftMs <= 0;

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-zinc-900 rounded-3xl w-full max-w-sm mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2">Escanea tu cupón</h2>
            <p className="text-center text-zinc-400 mb-8 text-sm">
                Muestra este código en la recepción del gimnasio. <br />
                No cierres esta pantalla.
            </p>

            {/* Borde animado anti-fraude: un gradiente giratorio continuo */}
            <div className={`relative p-2 rounded-2xl overflow-hidden ${isExpired ? 'opacity-50 grayscale' : ''}`}>

                {/* 
                  Animación CSS Conic Gradient para demostrar que la pantalla "está viva" 
                  (No es una foto estática)
                */}
                {!isExpired && (
                    <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,var(--theme-primary)_360deg)] animate-spin" style={{ animationDuration: '3s' }} />
                )}

                {/* El fondo sólido que rodea el QR protegiéndolo del gradiente */}
                <div className="relative bg-white p-4 rounded-xl z-10">
                    <QRCode
                        value={jwtToken}
                        size={200}
                        level="H"
                        includeMargin={false}
                        renderAs="canvas"
                        fgColor={isExpired ? "#999999" : "#09090b"}
                    />
                </div>
            </div>

            <div className="mt-8 text-center">
                <span className="block text-zinc-500 uppercase tracking-widest text-xs font-bold mb-1">
                    Válido por
                </span>
                {/* 
                   Contador dinámico 60fps de milisegundos 
                   El movimiento rápido destruye cualquier vector de Screenshot
                */}
                <span
                    ref={msRef}
                    className={`text-4xl font-mono text-center tracking-tighter tabular-nums ${isExpired ? 'text-red-500' : 'text-[var(--theme-primary)]'}`}
                >
                    00:000
                </span>
                {isExpired && (
                    <p className="text-red-400 mt-2 text-sm font-semibold animate-pulse">
                        Cupón Caducado
                    </p>
                )}
            </div>
        </div>
    );
};

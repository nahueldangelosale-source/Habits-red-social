import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Share2, Download, TrendingUp, ShieldCheck } from 'lucide-react';

interface TrophyData {
    patientName: string; // Will be anonymized
    weightLost: number;
    strengthGain: number;
    durationWeeks: number;
    archetype: string;
}

const MOCK_DATA: TrophyData = {
    patientName: 'Fernando P.',
    weightLost: 5.2,
    strengthGain: 18,
    durationWeeks: 12,
    archetype: 'Ectomorfo'
};

// Generates "Atleta #089A" style ID
const generateAnonId = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hex = (hash & 0x00FFFFFF).toString(16).toUpperCase().padStart(4, '0');
    return `Atleta #${hex}`;
};

// Minimalist SVG Sparkline
const Sparkline = () => (
    <svg viewBox="0 0 200 60" className="w-full h-24 overflow-visible">
        <defs>
            <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
        </defs>
        <path
            d="M0,50 Q40,45 80,30 T160,10 T200,5"
            fill="url(#neonGradient)"
            className="animate-pulse"
        />
        <path
            d="M0,50 Q40,45 80,30 T160,10 T200,5"
            fill="none"
            stroke="#6366f1"
            strokeWidth="3"
            strokeLinecap="round"
            className="drop-shadow-[0_0_10px_rgba(206,255,0,0.5)]"
        />
        <circle cx="200" cy="5" r="4" fill="#6366f1" className="drop-shadow-[0_0_15px_#6366f1]" />
    </svg>
);

export function TrophyCardGenerator() {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (!cardRef.current) return;
        try {
            setIsExporting(true);

            // Generate Image
            const dataUrl = await toPng(cardRef.current, {
                quality: 1,
                pixelRatio: 3, // High-res for Instagram/LinkedIn
                style: { transform: 'scale(1)' } // Fix scaling issues
            });

            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], 'coach-trophy.png', { type: 'image/png' });

            // Trigger Share Web API if supported
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'Caso de Ã‰xito',
                    text: 'Resultados del Protocolo de Entrenamiento.',
                    files: [file]
                });
            } else {
                // Fallback direct download
                const link = document.createElement('a');
                link.download = 'coach-trophy.png';
                link.href = dataUrl;
                link.click();
            }
        } catch (err) {
            console.error('Error exporting trophy:', err);
        } finally {
            setIsExporting(false);
        }
    };

    const anonId = generateAnonId(MOCK_DATA.patientName);

    return (
        <div className="flex flex-col items-center gap-6 p-8 bg-zinc-950 min-h-screen font-sans">

            <div className="text-center space-y-2 mb-4">
                <h2 className="text-2xl font-bold text-white font-sans tracking-tight">Activo Social (B2B)</h2>
                <p className="text-zinc-500 text-sm flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    AnonimizaciÃ³n HIPAA Compliance Activada
                </p>
            </div>

            {/* The Capture Area (1080x1080 ratio simulation via 400x400 container) */}
            <div
                ref={cardRef}
                className="w-[400px] h-[400px] bg-[#1A1A1A] relative flex flex-col justify-between p-10 overflow-hidden rounded-none"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px'
                }}
            >
                {/* Noise overlay */}
                <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

                {/* Header */}
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                            <span className="text-zinc-400 text-xs tracking-widest uppercase font-mono">Caso CÃ³d. {anonId.split('#')[1]}</span>
                        </div>
                        <h3 className="text-3xl font-sans font-bold text-white tracking-tighter">Bienestar OS</h3>
                    </div>
                    <div className="px-3 py-1 border border-zinc-700 rounded-full bg-zinc-900/50 backdrop-blur-md">
                        <span className="text-[10px] text-zinc-300 uppercase tracking-widest font-semibold">{MOCK_DATA.durationWeeks} Semanas</span>
                    </div>
                </div>

                {/* Main Metrics */}
                <div className="relative z-10 grid grid-cols-2 gap-4 mt-8">
                    <div className="flex flex-col gap-1">
                        <span className="text-zinc-500 text-xs uppercase tracking-widest font-semibold">Carga Absoluta</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-mono text-indigo-400 font-bold tabular-nums">+{MOCK_DATA.strengthGain}</span>
                            <span className="text-indigo-400 font-mono text-sm">%</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-zinc-500 text-xs uppercase tracking-widest font-semibold">Densidad Corporal</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-mono text-white font-bold tabular-nums">-{MOCK_DATA.weightLost}</span>
                            <span className="text-zinc-400 font-mono text-sm">kg</span>
                        </div>
                    </div>
                </div>

                {/* Chart Area */}
                <div className="relative z-10 mt-auto pt-6 border-t border-zinc-800">
                    <div className="absolute top-6 right-0 text-zinc-600 bg-zinc-900/80 px-2 py-1 rounded text-[10px] font-mono uppercase backdrop-blur-sm -translate-y-1/2">+ Progreso Lineal</div>
                    <Sparkline />
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] text-zinc-600 uppercase tracking-widest">Base</span>
                        <span className="text-[10px] text-zinc-600 uppercase tracking-widest text-indigo-400">Peak</span>
                    </div>
                </div>

            </div>

            {/* Social Action */}
            <button
                onClick={handleExport}
                disabled={isExporting}
                className="group relative flex items-center justify-center gap-2 w-[400px] bg-zinc-100 hover:bg-white text-zinc-950 py-4 rounded-2xl font-bold text-sm transition-all shadow-[0_10px_40px_rgba(255,255,255,0.1)] hover:shadow-[0_10px_40px_rgba(206,255,0,0.3)] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-wait"
            >
                {isExporting ? <TrendingUp className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5 group-hover:text-emerald-500 transition-colors" />}
                {isExporting ? 'Renderizando Activo...' : 'Generar ExportaciÃ³n a Redes'}
            </button>

        </div>
    );
}

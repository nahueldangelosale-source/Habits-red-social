import React, { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import { AlertOctagon, ShieldCheck } from 'lucide-react';

interface WatchtowerTrafficLightProps {
    capitalAtRiskUSD: number;
    totalMrrUSD: number;
    riskThresholdUSD: number; // The threshold that triggers the red alert
}

export const WatchtowerTrafficLight: React.FC<WatchtowerTrafficLightProps> = ({ 
    capitalAtRiskUSD, 
    totalMrrUSD, 
    riskThresholdUSD 
}) => {
    // Determine if we are in High Risk
    const isHighRisk = capitalAtRiskUSD >= riskThresholdUSD;
    
    // Calculate MRR impact percentage
    const mrrImpactPercentage = totalMrrUSD > 0 
        ? ((capitalAtRiskUSD / totalMrrUSD) * 100).toFixed(1) 
        : '0.0';

    // UI States based on risk
    const colorClass = isHighRisk ? 'text-risk-high' : 'text-clinical-muted';
    const bgClass = isHighRisk ? 'bg-red-50' : 'bg-slate-50';
    const borderColor = isHighRisk ? 'border-red-200' : 'border-slate-200';
    
    // Solo permitimos el renderizado y la tensión si cambian los datos (reducir "Banner Blindness")
    const [prevRisk, setPrevRisk] = useState<number>(0);

    useEffect(() => {
        // Al actualizar el valor crudo, guardamos el anterior para que el CountUp escale
        setPrevRisk(capitalAtRiskUSD);
    }, [capitalAtRiskUSD]);

    return (
        <div className={`flex flex-col items-center justify-center p-8 rounded-3xl border shadow-clinical transition-colors duration-700 ${bgClass} ${borderColor}`}>
            
            {/* Header del Semáforo */}
            <div className="flex items-center gap-2 mb-4">
                {isHighRisk ? (
                    <AlertOctagon size={24} className="text-risk-high animate-pulse" />
                ) : (
                    <ShieldCheck size={24} className="text-clinical-muted" />
                )}
                <h2 className="font-heading font-black text-sm uppercase tracking-widest text-clinical-text">
                    Capital en Riesgo
                </h2>
            </div>

            {/* H1 Masivo - El Dolor Monetario */}
            <h1 className={`font-heading font-black text-6xl tracking-tighter ${colorClass}`}>
                $
                <CountUp 
                    start={prevRisk === capitalAtRiskUSD ? 0 : prevRisk} 
                    end={capitalAtRiskUSD} 
                    duration={1.5} 
                    separator="," 
                    useEasing={true}
                    preserveValue={true}
                />
            </h1>

            {/* Traducción al Porcentaje del MRR (Estructural) */}
            <div className="mt-3 flex items-center gap-2">
                <span className="font-sans text-sm font-bold text-clinical-text">
                    Impacto Estructural:
                </span>
                <span className={`font-sans text-sm font-black px-2 py-1 rounded-md ${isHighRisk ? 'bg-red-100 text-risk-high' : 'bg-slate-200 text-clinical-muted'}`}>
                    {mrrImpactPercentage}% del MRR
                </span>
            </div>
            
            {/* Contexto de gravedad */}
            {isHighRisk && (
                <p className="font-sans text-xs font-medium text-risk-high mt-4 text-center max-w-xs opacity-80">
                    La aversión a la pérdida supera el umbral crítico operativo. Se requiere intervención del Staff.
                </p>
            )}
        </div>
    );
};

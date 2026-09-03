import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const ChartSkeleton: React.FC = () => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    // Colores base para el esqueleto
    const bgClass = isClinical ? 'bg-slate-100' : 'bg-white/5';
    const shimmerClass = isClinical 
        ? 'animate-pulse bg-slate-200' 
        : 'animate-pulse bg-white/10';

    return (
        <div className={`w-full h-full flex flex-col justify-end gap-2 p-4 rounded-xl ${bgClass}`}>
            {/* Eje Y Simulado */}
            <div className="flex h-full gap-4 items-end">
                <div className="flex flex-col justify-between h-full py-2 opacity-50 w-8">
                    <div className={`h-2 w-full rounded-full ${shimmerClass}`}></div>
                    <div className={`h-2 w-full rounded-full ${shimmerClass}`}></div>
                    <div className={`h-2 w-full rounded-full ${shimmerClass}`}></div>
                    <div className={`h-2 w-full rounded-full ${shimmerClass}`}></div>
                </div>

                {/* Barras/Área simulada */}
                <div className="flex-1 flex items-end justify-between gap-2 h-[80%]">
                    {[40, 60, 45, 80, 50, 90, 75].map((height, i) => (
                        <div 
                            key={i} 
                            style={{ height: `${height}%`, animationDelay: `${i * 100}ms` }} 
                            className={`w-full rounded-t-sm ${shimmerClass}`}
                        ></div>
                    ))}
                </div>
            </div>
            {/* Eje X Simulado */}
            <div className="flex justify-between pl-12 opacity-50 mt-2">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className={`h-2 w-6 rounded-full ${shimmerClass}`}></div>
                ))}
            </div>
            
            {/* Texto de Carga Psicológica */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-[10px] font-black tracking-widest uppercase opacity-70 ${isClinical ? 'text-indigo-600' : 'text-[var(--color-action-primary)]'}`}>
                    Renderizando Módulo...
                </span>
            </div>
        </div>
    );
};

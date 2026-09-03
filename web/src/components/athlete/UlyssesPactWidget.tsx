import React from 'react';
import { Lock, AlertOctagon, ShieldAlert } from 'lucide-react';

interface UlyssesPactWidgetProps {
    isLocked: boolean;
    stakeAmount: number;
    antiCharityName: string;
}

export const UlyssesPactWidget: React.FC<UlyssesPactWidgetProps> = ({ 
    isLocked, 
    stakeAmount, 
    antiCharityName 
}) => {
    
    // Formateador de moneda (Ej: $10.000)
    const formattedStake = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0
    }).format(stakeAmount);

    return (
        <div className="bg-white dark:bg-[#0a0d16] rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-500 flex items-center justify-center shrink-0">
                    <AlertOctagon size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white flex items-center gap-2">
                        Pacto de Ulises
                        {isLocked && <Lock size={12} className="text-slate-400" />}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <strong className="text-red-600 dark:text-red-400">{formattedStake}</strong> en riesgo por: {antiCharityName}.
                    </p>
                </div>
            </div>
            <button className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                Ver Detalles
            </button>
        </div>
    );
};

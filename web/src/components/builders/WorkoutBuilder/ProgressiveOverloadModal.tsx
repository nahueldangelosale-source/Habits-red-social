
import React from 'react';
import { TrendingUp, ArrowRight, Layers, Weight } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

interface ProgressiveOverloadModalProps {
    onClose: () => void;
    onApply: (mode: 'linear' | 'volume') => void;
}

export const ProgressiveOverloadModal: React.FC<ProgressiveOverloadModalProps> = ({ onClose, onApply }) => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    return (
        <div className="fixed inset-0 bg-zinc-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className={`w-full max-w-md rounded-2xl overflow-hidden shadow-2xl ${isClinical
                ? 'bg-white'
                : 'bg-zinc-900 border border-white/10'}`}>

                {/* Header */}
                <div className={`p-6 border-b ${isClinical ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${isClinical ? 'bg-amber-100 text-amber-600' : 'bg-indigo-500/20 text-indigo-400'}`}>
                            <TrendingUp size={20} />
                        </div>
                        <h3 className={`text-xl font-bold ${isClinical ? 'text-slate-800' : 'text-white'}`}>
                            Progressive Overload
                        </h3>
                    </div>
                    <p className={`text-sm ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                        Clone this week and auto-scale intensity relative to user performance.
                    </p>
                </div>

                {/* Options */}
                <div className="p-6 space-y-4">
                    <button
                        onClick={() => onApply('linear')}
                        className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all group ${isClinical
                            ? 'border-slate-200 hover:border-amber-500 hover:bg-amber-50'
                            : 'border-white/10 hover:border-indigo-500 hover:bg-indigo-500/10'}`}>
                        <div className={`p-3 rounded-full ${isClinical ? 'bg-white shadow-sm' : 'bg-zinc-950/40'}`}>
                            <Weight size={20} className={isClinical ? 'text-amber-500' : 'text-indigo-400'} />
                        </div>
                        <div className="text-left flex-1">
                            <h4 className={`font-bold text-sm ${isClinical ? 'text-slate-800' : 'text-white'}`}>Linear Progression</h4>
                            <p className={`text-xs ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>+2.5kg to compound lifts, maintain reps.</p>
                        </div>
                        <ArrowRight size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity ${isClinical ? 'text-amber-500' : 'text-indigo-400'}`} />
                    </button>

                    <button
                        onClick={() => onApply('volume')}
                        className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all group ${isClinical
                            ? 'border-slate-200 hover:border-indigo-500 hover:bg-indigo-50'
                            : 'border-white/10 hover:border-indigo-400 hover:bg-indigo-500/10'}`}>
                        <div className={`p-3 rounded-full ${isClinical ? 'bg-white shadow-sm' : 'bg-zinc-950/40'}`}>
                            <Layers size={20} className={isClinical ? 'text-indigo-500' : 'text-indigo-400'} />
                        </div>
                        <div className="text-left flex-1">
                            <h4 className={`font-bold text-sm ${isClinical ? 'text-slate-800' : 'text-white'}`}>Volume Accumulation</h4>
                            <p className={`text-xs ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>+1 Set to isolation movements.</p>
                        </div>
                        <ArrowRight size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity ${isClinical ? 'text-indigo-500' : 'text-indigo-400'}`} />
                    </button>
                </div>

                {/* Footer */}
                <div className={`p-4 border-t flex justify-end ${isClinical ? 'border-slate-100' : 'border-white/5'}`}>
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${isClinical ? 'text-slate-500 hover:text-slate-800' : 'text-zinc-500 hover:text-white'}`}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

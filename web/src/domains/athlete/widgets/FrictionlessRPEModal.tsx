import React, { useState, useEffect } from 'react';
import { Activity, X, Zap } from 'lucide-react';
import { flushSync } from 'react-dom';

interface FrictionlessRPEProps {
    exerciseName: string;
    onClose: () => void;
    onSubmitRPE: (rpe: number, reps: number, weight: number) => void;
}

export const FrictionlessRPEModal: React.FC<FrictionlessRPEProps> = ({ exerciseName, onClose, onSubmitRPE }) => {
    const [isVisible, setIsVisible] = useState(false);
    
    // RPE Scale 1-10 with corresponding Semantic Colors
    const rpeScale = [
        { val: 6, label: "Fácil", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/40" },
        { val: 7, label: "Moderado", color: "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/40" },
        { val: 8, label: "Difícil (RIR 2)", color: "bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/40" },
        { val: 9, label: "Muy Difícil (RIR 1)", color: "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/40" },
        { val: 10, label: "Fallo (RIR 0)", color: "bg-rose-600/20 text-rose-500 border-rose-600/30 hover:bg-rose-600/40 font-bold" }
    ];

    // Simulate entry animation for View Transitions lookalike
    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleSelectRpe = (rpe: number) => {
        // Frictionless submission: Fast local-db optimistic update 
        // We mock actual reps/weight input for this specific zero-friction demonstration.
        // In reality, this triggers a transition back to the workout screen instantly.
        if (document.startViewTransition) {
            document.startViewTransition(() => {
                flushSync(() => {
                    onSubmitRPE(rpe, 10, 50); // Mocks 10 reps, 50kg
                    onClose();
                });
            });
        } else {
            onSubmitRPE(rpe, 10, 50);
            onClose();
        }
    };

    return (
        <div className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* Immersive Blur Backdrop */}
            <div 
                className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md" 
                onClick={onClose}
            ></div>

            {/* Neural Modal Body */}
            <div className={`relative w-full sm:max-w-md bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isVisible ? 'translate-y-0' : 'translate-y-full sm:translate-y-8 sm:scale-95'}`}>
                
                {/* Drag Handle for Mobile */}
                <div className="w-full h-1.5 flex justify-center mt-3 sm:hidden">
                    <div className="w-12 h-1.5 bg-zinc-700/50 rounded-full"></div>
                </div>

                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                         <div>
                             <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold flex items-center gap-1.5 mb-1">
                                 <Zap size={12} className="fill-indigo-400" /> Auto-Regulación
                             </p>
                             <h2 className="text-xl font-bold text-white tracking-tight leading-tight">
                                 ¿Qué tan díficil fue <br/><span className="text-zinc-400">{exerciseName}?</span>
                             </h2>
                         </div>
                         <button onClick={onClose} className="p-2 bg-zinc-800/50 rounded-full text-zinc-400 hover:text-white transition-colors">
                             <X size={16} />
                         </button>
                    </div>

                    {/* Zero-Friction RPE Core */}
                    <div className="space-y-3">
                         {rpeScale.reverse().map((rpe) => (
                             <button
                                 key={rpe.val}
                                 onClick={() => handleSelectRpe(rpe.val)}
                                 className={`w-full h-16 rounded-2xl flex items-center justify-between px-5 border transition-all active:scale-[0.98] ${rpe.color} group`}
                             >
                                  <div className="flex items-center gap-3">
                                      {rpe.val >= 9 && <Activity size={18} className="animate-pulse" />}
                                      <span className="font-bold text-lg tracking-wide">{rpe.label}</span>
                                  </div>
                                  <span className="text-2xl font-black opacity-80 group-hover:opacity-100 font-mono">
                                      {rpe.val}
                                  </span>
                             </button>
                         ))}
                    </div>

                    <p className="text-center text-[10px] text-zinc-500 mt-6 tracking-wide uppercase px-8">
                        Toca para guardar asíncronamente en la base de datos local (0ms TTI)
                    </p>
                </div>
            </div>
        </div>
    );
};

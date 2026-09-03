import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Zap, Activity, HeartPulse, ShieldAlert, ArrowRight, LayoutGrid } from 'lucide-react';
import { usePlanBuilderStore } from '../../stores/usePlanBuilderStore';
import type { Discipline } from '../../utils/builderDictionary';

interface DisciplineOption {
    id: Discipline;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
}

const DISCIPLINES: DisciplineOption[] = [
    {
        id: 'STRENGTH',
        title: 'Hipertrofia / Fuerza',
        description: 'Estructura tradicional en macrociclos y mesociclos.',
        icon: <Dumbbell size={24} />,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50'
    },
    {
        id: 'CROSSFIT',
        title: 'CrossFit / Funcional',
        description: 'Diseño rápido de WODs, EMOMs y AMRAPs sin fases.',
        icon: <Zap size={24} />,
        color: 'text-orange-600',
        bg: 'bg-orange-50'
    },
    {
        id: 'YOGA',
        title: 'Yoga / Pilates',
        description: 'Construcción de clases, secuencias y flujos.',
        icon: <Activity size={24} />,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50'
    },
    {
        id: 'ENDURANCE',
        title: 'Resistencia / Cíclico',
        description: 'Programación lineal para corredores, ciclistas o nadadores.',
        icon: <HeartPulse size={24} />,
        color: 'text-cyan-600',
        bg: 'bg-cyan-50'
    },
    {
        id: 'CLINICAL',
        title: 'Clínico / Rehab',
        description: 'Protocolos de fisioterapia con dosificación controlada.',
        icon: <ShieldAlert size={24} />,
        color: 'text-rose-600',
        bg: 'bg-rose-50'
    }
];

interface DisciplineSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DisciplineSelectorModal: React.FC<DisciplineSelectorModalProps> = ({ isOpen, onClose }) => {
    const { discipline, setDiscipline } = usePlanBuilderStore();
    const [selectedId, setSelectedId] = useState<Discipline>(discipline);

    if (!isOpen) return null;

    const handleConfirm = () => {
        setDiscipline(selectedId);
        // Track
        console.log(`[GA4 Event] discipline_selected: discipline=${selectedId}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] border border-slate-100"
                >
                    {/* Decorative Background Effects */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    
                    <div className="p-8 pb-6 border-b border-slate-100 bg-white text-center relative z-10">
                        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-50 to-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-4 ring-white shadow-inner">
                            <LayoutGrid className="w-8 h-8 text-indigo-500" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 font-montserrat tracking-tight mb-3">
                            Diseñemos el plan de ataque
                        </h2>
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 max-w-md mx-auto">
                            <p className="text-sm text-slate-600 font-medium font-lato leading-relaxed">
                                <strong className="text-indigo-600 font-black">Habits</strong> adaptará su interfaz y lenguaje para ofrecerte una experiencia libre de fricción basada en tu nicho.
                            </p>
                        </div>
                    </div>

                    <div className="p-6 overflow-y-auto relative z-10 bg-slate-50/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {DISCIPLINES.map(opt => (
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    key={opt.id}
                                    onClick={() => setSelectedId(opt.id)}
                                    className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-300 overflow-hidden ${
                                        selectedId === opt.id 
                                            ? 'border-indigo-500 bg-white shadow-md ring-4 ring-indigo-500/10' 
                                            : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm'
                                    }`}
                                >
                                    {selectedId === opt.id && (
                                        <motion.div layoutId="active-bg" className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-violet-50/50 opacity-50" />
                                    )}
                                    
                                    <div className={`p-3 rounded-xl shrink-0 relative z-10 ${selectedId === opt.id ? 'bg-indigo-100 text-indigo-600 shadow-sm' : `${opt.bg} ${opt.color}`}`}>
                                        {opt.icon}
                                    </div>
                                    <div className="flex flex-col relative z-10">
                                        <h3 className={`text-[15px] font-black font-montserrat tracking-tight ${selectedId === opt.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                                            {opt.title}
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                                            {opt.description}
                                        </p>
                                    </div>
                                    
                                    {selectedId === opt.id && (
                                        <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                                        </div>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-white flex justify-end relative z-10">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleConfirm}
                            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-3.5 rounded-xl text-[15px] font-bold shadow-lg shadow-indigo-600/25 hover:shadow-xl transition-all flex items-center gap-2"
                        >
                            Comenzar Estructura <ArrowRight size={18} />
                        </motion.button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

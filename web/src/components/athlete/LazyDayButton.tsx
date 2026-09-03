import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, ShieldCheck, X } from 'lucide-react';

export const LazyDayButton: React.FC = () => {
    const [isUsed, setIsUsed] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleConfirm = () => {
        setIsUsed(true);
        setShowModal(false);
    };

    return (
        <>
            <div className="bg-white dark:bg-[#0a0d16] rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2 mb-1">
                            <Coffee size={16} className={isUsed ? 'text-amber-500' : 'text-slate-400'} />
                            Comodín "Lazy Day"
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {isUsed ? 'Comodín utilizado esta semana.' : '1 disponible esta semana.'}
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => !isUsed && setShowModal(true)}
                        disabled={isUsed}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                            isUsed 
                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 cursor-not-allowed opacity-80'
                                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                    >
                        {isUsed ? 'Activo (Ámbar)' : 'Usar Comodín'}
                    </button>
                </div>
            </div>

            {/* Modal de Confirmación */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="w-full max-w-sm bg-white dark:bg-[#0a0d16] rounded-3xl overflow-hidden shadow-2xl relative border border-slate-200 dark:border-slate-800"
                        >
                            <button 
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 z-20 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                            
                            <div className="p-6 pt-8 text-center">
                                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ShieldCheck size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Activar Lazy Day</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                                    Tu objetivo de hoy bajará al mínimo (Ej: 5 flexiones). Tu racha y el pacto de tu tribu se mantendrán a salvo en estado <strong className="text-amber-500">Ámbar</strong>.
                                </p>
                                
                                <button 
                                    onClick={handleConfirm}
                                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black text-sm uppercase tracking-widest py-3.5 rounded-xl shadow-lg transition-all"
                                >
                                    Confirmar (1 uso restante)
                                </button>
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="w-full mt-2 bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-all"
                                >
                                    Cancelar, puedo hacerlo
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

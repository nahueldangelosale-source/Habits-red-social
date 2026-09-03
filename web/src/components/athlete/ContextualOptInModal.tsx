import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Share2, ShieldCheck, X } from 'lucide-react';

interface OptInModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApprove: () => void;
}

export const ContextualOptInModal: React.FC<OptInModalProps> = ({ isOpen, onClose, onApprove }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                >
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden"
                    >
                        {/* Decoración Superior */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-amber-500" />
                        
                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex justify-center mb-6 mt-2">
                            <div className="w-16 h-16 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl flex items-center justify-center relative">
                                <Trophy className="w-8 h-8 text-yellow-400" />
                                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-zinc-900">
                                    <ShieldCheck className="w-3 h-3 text-white" />
                                </div>
                            </div>
                        </div>

                        <h3 className="text-xl font-black text-white text-center mb-2">¡Hito Superado!</h3>
                        
                        <p className="text-sm text-zinc-400 text-center mb-6 leading-relaxed">
                            Has alcanzado un nuevo Récord Personal. Tu entrenador está muy orgulloso de este logro. 
                            ¿Autorizas que genere una <strong>Tarjeta Anónima de Esfuerzo</strong> para inspirar a la tribu?
                        </p>

                        <div className="bg-zinc-950 rounded-xl p-3 mb-6 flex items-start border border-white/5">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 mr-2 mt-0.5 shrink-0" />
                            <p className="text-xs text-zinc-500">
                                <strong className="text-zinc-300">Privacidad Diferencial Activa:</strong> Tu nombre, foto y métricas de peso exactas no serán reveladas. Solo se compartirá el porcentaje de progreso.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button 
                                onClick={() => {
                                    onApprove();
                                    onClose();
                                }}
                                className="w-full py-3 bg-yellow-400 text-black font-bold rounded-xl shadow-[0_0_15px_rgba(250,204,21,0.2)] hover:bg-yellow-300 transition-colors flex justify-center items-center"
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Sí, permitir compartir anónimo
                            </button>
                            <button 
                                onClick={onClose}
                                className="w-full py-3 bg-transparent text-zinc-400 font-bold rounded-xl hover:text-white transition-colors"
                            >
                                No por ahora, mantener privado
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

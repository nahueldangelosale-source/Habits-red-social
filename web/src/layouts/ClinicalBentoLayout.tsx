import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Beaker, FileText, ActivitySquare, Brain, Droplets } from 'lucide-react';

interface ClinicalBentoLayoutProps {
    children?: React.ReactNode;
}

export const ClinicalBentoLayout: React.FC<ClinicalBentoLayoutProps> = ({ children }) => {
    // If children are provided, we wrap them in the grid.
    // If not (like in the /smartlab route), we render the default SmartLab Dashboard.
    
    return (
        <div className="min-h-screen bg-premium-clinical pt-24 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                {!children && (
                    <header className="mb-8">
                        <h1 className="text-hero-title mb-2 text-slate-900">SmartLab Central</h1>
                        <p className="text-slate-500">
                            Análisis de biomarcadores y telemetría clínica.
                        </p>
                    </header>
                )}

                <div className="bento-grid">
                    {children ? (
                        children
                    ) : (
                        <>
                            {/* Hero Card */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bento-card glass-card-clinical col-span-12 md:col-span-8 row-span-2 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Beaker className="w-48 h-48 text-indigo-500" />
                                </div>
                                <h3 className="card-title text-indigo-600 mb-4 flex items-center gap-2"><ActivitySquare className="w-4 h-4" /> METABOLIC ENGINE</h3>
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="text-5xl font-mono tracking-tighter font-bold text-slate-900 mb-2">92.4 <span className="text-2xl text-slate-400">VO2 Max</span></div>
                                    <p className="text-slate-600 max-w-md">El motor metabólico de los atletas de alto rendimiento está operando en zonas óptimas. No se detectan anomalías en el ácido láctico.</p>
                                </div>
                            </motion.div>

                            {/* Side Stats */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bento-card glass-card-clinical col-span-12 md:col-span-4 flex items-center justify-center flex-col text-center"
                            >
                                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                                    <Droplets className="w-6 h-6" />
                                </div>
                                <div className="text-3xl font-bold font-mono text-slate-900 mb-1">Blood Panel</div>
                                <div className="text-sm text-slate-500 uppercase tracking-widest font-semibold">12 Pending</div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bento-card glass-card-clinical col-span-12 md:col-span-4 flex items-center justify-center flex-col text-center"
                            >
                                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                                    <Brain className="w-6 h-6" />
                                </div>
                                <div className="text-3xl font-bold font-mono text-slate-900 mb-1">Neurology</div>
                                <div className="text-sm text-slate-500 uppercase tracking-widest font-semibold">CNS Fatigue: Low</div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bento-card glass-card-clinical col-span-12 md:col-span-8 bg-slate-900 text-white"
                            >
                                <h3 className="card-title text-slate-400 mb-4 flex items-center gap-2"><FileText className="w-4 h-4" /> RECENT LAB REPORTS</h3>
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                                                    <Activity className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold">Perfil Hormonal - Atleta #{4392 + i}</div>
                                                    <div className="text-xs text-slate-400">Dr. Hans • Procesado hace {i}h</div>
                                                </div>
                                            </div>
                                            <button className="btn btn-sm bg-white text-black">Ver PDF</button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClinicalBentoLayout;

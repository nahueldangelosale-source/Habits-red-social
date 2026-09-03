import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanSearch, AlertOctagon, FileCheck, FileSignature, CheckCircle, BrainCircuit } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface LabResult {
    id: string;
    biomarker: string;
    value: number;
    unit: string;
    referenceRange: string;
    isAnomaly: boolean;
    deviations: number;
    pdfSnippetUrl?: string;
}

export const SmartLabOCR: React.FC = () => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    // Mock OCR Data
    const [results, setResults] = useState<LabResult[]>([
        { id: '1', biomarker: 'Glucosa Ayunas', value: 85, unit: 'mg/dL', referenceRange: '70 - 100', isAnomaly: false, deviations: 0 },
        { id: '2', biomarker: 'Triglicéridos', value: 850, unit: 'mg/dL', referenceRange: '0 - 150', isAnomaly: true, deviations: 4.5, pdfSnippetUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=800' }, // Fake blur/snippet for concept
        { id: '3', biomarker: 'Colesterol HDL', value: 55, unit: 'mg/dL', referenceRange: '> 40', isAnomaly: false, deviations: 0 },
    ]);

    const [anomalyConfirmed, setAnomalyConfirmed] = useState<boolean>(false);
    const [overrideToken, setOverrideToken] = useState<string | null>(null);
    const [pin, setPin] = useState<string>('');
    const hasCriticalAnomaly = results.some(r => r.deviations > 3);

    const handleConfirmAnomaly = (checked: boolean) => {
        setAnomalyConfirmed(checked);
        if (checked) {
            // Generar hash criptográfico (OverrideToken)
            const hash = Math.random().toString(36).substring(2, 10).toUpperCase();
            setOverrideToken(`OVR-TX-${hash}`);
        } else {
            setOverrideToken(null);
        }
    };

    return (
        <div className={`p-8 min-h-screen relative ${isClinical ? 'bg-[#f8fafc]' : 'bg-[#0a0a0a]'}`}>
            
            <header className="mb-10">
                <h2 className={`text-3xl font-black tracking-tight flex items-center ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                    <ScanSearch className="w-8 h-8 mr-3 text-emerald-500" />
                    Sala de Verificación OCR
                </h2>
                <p className={`text-sm mt-1 font-medium ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Extracción de Laboratorios: "Paciente Ana M."</p>
            </header>

            <div className="grid gap-6 md:grid-cols-2">
                
                {/* Resultados Estándar */}
                <div className={`p-6 rounded-3xl border ${isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900 border-zinc-800'}`}>
                    <h3 className={`text-sm font-bold uppercase tracking-widest mb-6 ${isClinical ? 'text-slate-400' : 'text-zinc-400'}`}>Valores Detectados</h3>
                    <div className="space-y-4">
                        {results.map((res) => (
                            <div key={res.id} className={`flex items-center justify-between p-4 rounded-2xl border ${
                                res.isAnomaly 
                                    ? (isClinical ? 'bg-rose-50 border-rose-200' : 'bg-rose-950/20 border-rose-900/50')
                                    : (isClinical ? 'bg-slate-50 border-slate-100' : 'bg-black/20 border-white/5')
                            }`}>
                                <div>
                                    <p className={`font-bold ${isClinical ? 'text-slate-800' : 'text-zinc-300'}`}>{res.biomarker}</p>
                                    <p className={`text-xs ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Ref: {res.referenceRange}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-xl font-black ${
                                        res.isAnomaly 
                                            ? (isClinical ? 'text-rose-600' : 'text-rose-400')
                                            : (isClinical ? 'text-slate-900' : 'text-white')
                                    }`}>
                                        {res.value}
                                    </span>
                                    <span className={`text-xs ml-1 ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>{res.unit}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hard Stop / Fricción Intencional */}
                <AnimatePresence>
                    {hasCriticalAnomaly && !anomalyConfirmed ? (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative z-50"
                        >
                            {/* Backdrop Micro-Dimming para enfocar la atención */}
                            <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40" />
                            
                            <div className={`relative z-50 p-6 rounded-3xl border-2 shadow-2xl ${
                                isClinical ? 'bg-white border-rose-500' : 'bg-zinc-950 border-rose-500'
                            }`}>
                                <div className="flex items-center mb-4 text-rose-500">
                                    <AlertOctagon className="w-6 h-6 mr-2" />
                                    <h3 className="font-black tracking-widest uppercase">Hard Stop Clínico</h3>
                                </div>
                                
                                <p className={`text-sm mb-4 leading-relaxed ${isClinical ? 'text-slate-600' : 'text-zinc-400'}`}>
                                    El OCR ha detectado un valor que supera las <strong>3 desviaciones estándar</strong> poblacionales (Triglicéridos: 850 mg/dL). 
                                    Para prevenir una inyección tóxica en DietQA, requiero tu Doble Firma.
                                </p>

                                {/* Ampliación visual del PDF original */}
                                <div className="mb-6 rounded-xl overflow-hidden border-2 border-rose-500/30 relative">
                                    <div className="absolute top-0 left-0 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                                        Fragmento PDF Original
                                    </div>
                                    <img 
                                        src={results.find(r => r.isAnomaly)?.pdfSnippetUrl} 
                                        alt="PDF Extract" 
                                        className="w-full h-32 object-cover opacity-80"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-black/60 backdrop-blur-sm text-rose-400 font-mono text-xl px-4 py-2 border border-rose-500 rounded-lg">
                                            "TRIGLICERIDOS .... 850 mg/dL"
                                        </div>
                                    </div>
                                </div>

                                {/* Firma Electrónica Deliberada (Fricción Activa) */}
                                <div className={`p-4 rounded-xl border ${isClinical ? 'bg-rose-50 border-rose-200' : 'bg-rose-950/30 border-rose-900/50'}`}>
                                    <label className={`block text-sm font-bold mb-2 ${isClinical ? 'text-rose-900' : 'text-rose-200'}`}>
                                        Firma Electrónica Requerida (PIN)
                                    </label>
                                    <p className={`text-xs mb-3 leading-relaxed ${isClinical ? 'text-rose-700/80' : 'text-rose-300/80'}`}>
                                        Al firmar, usted confirma haber revisado el documento original y asume responsabilidad legal de inyectar este parámetro extremo al motor RAG. Ingrese su PIN de 4 dígitos.
                                    </p>
                                    <input 
                                        type="password"
                                        maxLength={4}
                                        value={pin}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            setPin(val);
                                            if (val.length === 4) {
                                                handleConfirmAnomaly(true);
                                            } else {
                                                handleConfirmAnomaly(false);
                                            }
                                        }}
                                        className={`w-32 text-center font-mono text-xl tracking-widest rounded-lg p-3 outline-none transition-all ${
                                            isClinical 
                                                ? 'bg-white border-2 border-rose-300 text-rose-900 focus:border-rose-500 shadow-inner' 
                                                : 'bg-black/40 border-2 border-rose-700 text-rose-300 focus:border-rose-500 shadow-inner'
                                        }`}
                                        placeholder="••••"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`p-6 rounded-3xl border flex flex-col items-center justify-center text-center ${
                                isClinical ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-950/20 border-emerald-900/30'
                            }`}
                        >
                            <FileCheck className={`w-16 h-16 mb-4 ${isClinical ? 'text-emerald-500' : 'text-emerald-400'}`} />
                            <h3 className={`text-xl font-black mb-2 ${isClinical ? 'text-emerald-800' : 'text-emerald-300'}`}>Laboratorios Validados</h3>
                            <p className={`text-sm mb-2 ${isClinical ? 'text-emerald-600/80' : 'text-emerald-500/70'}`}>
                                Los Hard Constraints poblacionales están listos para inyectarse en el motor RAG.
                            </p>
                            
                            {overrideToken && (
                                <div className="mb-6 p-3 bg-black/10 border border-black/5 rounded-lg text-xs font-mono text-emerald-700 font-bold">
                                    Doble Firma Detectada. Token: {overrideToken}
                                </div>
                            )}

                            <button className={`py-4 px-8 rounded-xl font-black shadow-xl flex items-center transition-all hover:scale-105 active:scale-95 ${
                                isClinical ? 'bg-emerald-600 text-white shadow-emerald-600/20' : 'bg-emerald-500 text-black shadow-emerald-500/20'
                            }`}
                            onClick={() => {
                                if (hasCriticalAnomaly && !overrideToken) {
                                    alert("FALLO DE SEGURIDAD: Falta OverrideToken");
                                    return;
                                }
                                alert("Inyección Exitosa al Motor RAG");
                            }}
                            >
                                <BrainCircuit className="w-5 h-5 mr-2" />
                                Inyectar a DietQA 2.0
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

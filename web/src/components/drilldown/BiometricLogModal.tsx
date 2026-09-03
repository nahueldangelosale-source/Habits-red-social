import React, { useState } from 'react';
import { X, Calculator, Activity, BrainCircuit, HeartPulse, ShieldAlert, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface BiometricLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: any;
    onSave: (data: any) => void;
    isClinical: boolean;
}

export const BiometricLogModal: React.FC<BiometricLogModalProps> = ({ isOpen, onClose, patient, onSave, isClinical }) => {
    // Basic Metrics
    const [weight, setWeight] = useState(patient?.weight?.toString() || '');
    const [waist, setWaist] = useState(patient?.waist?.toString() || '');
    const height = patient?.height || 170; // fallback if not available

    // ISAK Skinfolds (3 attempts each)
    const [skinfolds, setSkinfolds] = useState({
        tricep: ['', '', ''],
        bicep: ['', '', ''],
        subscapular: ['', '', ''],
        suprailiac: ['', '', '']
    });

    // Handle skinfold change
    const handleSkinfoldChange = (fold: keyof typeof skinfolds, index: number, value: string) => {
        const newFold = [...skinfolds[fold]];
        newFold[index] = value;
        setSkinfolds({ ...skinfolds, [fold]: newFold });
    };

    // Calculate Median for an array of strings
    const getMedian = (values: string[]) => {
        const nums = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
        if (nums.length === 0) return 0;
        nums.sort((a, b) => a - b);
        const mid = Math.floor(nums.length / 2);
        return nums.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
    };

    // Medians
    const tricepMedian = getMedian(skinfolds.tricep);
    const bicepMedian = getMedian(skinfolds.bicep);
    const subscapularMedian = getMedian(skinfolds.subscapular);
    const suprailiacMedian = getMedian(skinfolds.suprailiac);

    // Sum of skinfolds
    const sumOfSkinfolds = tricepMedian + bicepMedian + subscapularMedian + suprailiacMedian;

    // Body Fat % (Durnin-Womersley approximation)
    const calculateBodyFat = () => {
        if (sumOfSkinfolds === 0) return 0;
        const logSum = Math.log10(sumOfSkinfolds);
        const density = patient?.gender === 'female' 
            ? 1.1599 - (0.0717 * logSum)
            : 1.1620 - (0.0630 * logSum);
        const bf = (495 / density) - 450;
        return Math.max(0, Math.min(bf, 60)).toFixed(1);
    };

    const bodyFat = calculateBodyFat();

    // BMI
    const w = parseFloat(weight) || 0;
    const bmi = w > 0 && height > 0 ? (w / Math.pow(height / 100, 2)).toFixed(1) : 0;
    
    // FFMI
    const bfNum = parseFloat(bodyFat) || 0;
    const leanMass = w * (1 - bfNum / 100);
    const ffmi = leanMass > 0 && height > 0 ? (leanMass / Math.pow(height / 100, 2)).toFixed(1) : 0;

    // Delta Weight
    const previousWeight = patient?.weight || 0;
    const weightDelta = (w - previousWeight).toFixed(1);

    // Risk Triggers
    const waistNum = parseFloat(waist) || 0;
    const isMetsRisk = (patient?.gender === 'female' && waistNum > 85) || (patient?.gender !== 'female' && waistNum > 90);
    const isWeightRebound = parseFloat(weightDelta) >= 2;

    const handleSave = () => {
        if (!w) {
            toast.error("El peso es obligatorio");
            return;
        }

        if (isWeightRebound) {
            toast.error(`⚠️ Alerta Clínica: Rebote de peso detectado (+${weightDelta} kg)`, { duration: 5000 });
        }

        if (isMetsRisk) {
            toast.error("⚠️ Alerta Clínica: Riesgo Metabólico detectado por perímetro abdominal.", { duration: 5000 });
        }

        onSave({
            date: new Date().toISOString().split('T')[0],
            weight: w,
            waist: waistNum,
            bodyFat: bfNum,
            bmi: parseFloat(bmi as string),
            ffmi: parseFloat(ffmi as string),
            skinfolds: {
                tricep: tricepMedian,
                bicep: bicepMedian,
                subscapular: subscapularMedian,
                suprailiac: suprailiacMedian
            }
        });
        
        toast.success("Telemetría Biométrica guardada con precisión ISAK.");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl shadow-2xl ${
                        isClinical ? 'bg-white' : 'bg-zinc-950 border border-zinc-800'
                    }`}
                >
                    <div className={`p-6 border-b flex justify-between items-center ${isClinical ? 'border-slate-200' : 'border-zinc-800'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${isClinical ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                <Activity size={24} />
                            </div>
                            <div>
                                <h2 className={`text-xl font-black ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                                    Registrar Medición
                                </h2>
                                <p className={`text-xs font-bold mt-0.5 ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                                    Telemetría Avanzada (Estándar ISAK)
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${isClinical ? 'hover:bg-slate-100' : 'hover:bg-zinc-800'}`}>
                            <X size={20} className={isClinical ? 'text-slate-500' : 'text-zinc-400'} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column: Core Metrics */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${isClinical ? 'text-slate-400' : 'text-zinc-500'}`}>
                                        <HeartPulse size={16} />
                                        Métricas Core
                                    </h3>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-xs font-bold mb-1.5 ${isClinical ? 'text-slate-700' : 'text-zinc-300'}`}>Peso (kg)</label>
                                            <input 
                                                type="number"
                                                value={weight}
                                                onChange={(e) => setWeight(e.target.value)}
                                                className={`w-full px-4 py-3 rounded-xl font-bold transition-colors ${
                                                    isClinical 
                                                        ? 'bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200' 
                                                        : 'bg-zinc-900 border border-zinc-800 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                                                }`}
                                                placeholder="Ej. 75.5"
                                            />
                                            {weightDelta !== '0.0' && (
                                                <p className={`text-[10px] font-bold mt-1.5 ${parseFloat(weightDelta) > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                    Δ {parseFloat(weightDelta) > 0 ? '+' : ''}{weightDelta} kg vs anterior
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-bold mb-1.5 ${isClinical ? 'text-slate-700' : 'text-zinc-300'}`}>Cintura (cm)</label>
                                            <input 
                                                type="number"
                                                value={waist}
                                                onChange={(e) => setWaist(e.target.value)}
                                                className={`w-full px-4 py-3 rounded-xl font-bold transition-colors ${
                                                    isClinical 
                                                        ? 'bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200' 
                                                        : 'bg-zinc-900 border border-zinc-800 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                                                }`}
                                                placeholder="Ej. 82"
                                            />
                                            {isMetsRisk && (
                                                <p className="text-[10px] font-bold text-rose-500 mt-1.5 flex items-center gap-1">
                                                    <ShieldAlert size={12} /> Alerta MetS
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className={`p-4 rounded-2xl border ${isClinical ? 'bg-indigo-50 border-indigo-100' : 'bg-indigo-500/10 border-indigo-500/20'}`}>
                                    <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isClinical ? 'text-indigo-600' : 'text-indigo-400'}`}>
                                        Calculadora Biométrica Automática
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className={`text-xs ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>IMC (BMI)</p>
                                            <p className={`text-2xl font-black ${isClinical ? 'text-slate-900' : 'text-white'}`}>{bmi}</p>
                                        </div>
                                        <div>
                                            <p className={`text-xs ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>FFMI (Muscularidad)</p>
                                            <p className={`text-2xl font-black ${isClinical ? 'text-slate-900' : 'text-white'}`}>{ffmi}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: ISAK Protocol */}
                            <div>
                                <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center justify-between ${isClinical ? 'text-slate-400' : 'text-zinc-500'}`}>
                                    <span className="flex items-center gap-2"><BrainCircuit size={16} /> Triangulación ISAK (Pliegues)</span>
                                    <span className="text-[10px] bg-slate-800 text-white px-2 py-0.5 rounded-full">Mediana</span>
                                </h3>

                                <div className="space-y-3">
                                    {[
                                        { id: 'tricep', label: 'Tricipital' },
                                        { id: 'bicep', label: 'Bicipital' },
                                        { id: 'subscapular', label: 'Subescapular' },
                                        { id: 'suprailiac', label: 'Suprailíaco' }
                                    ].map((fold) => (
                                        <div key={fold.id} className={`p-3 rounded-xl border flex items-center justify-between ${isClinical ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                                            <span className={`text-xs font-bold w-24 ${isClinical ? 'text-slate-700' : 'text-zinc-300'}`}>{fold.label}</span>
                                            <div className="flex items-center gap-2 flex-1">
                                                {[0, 1, 2].map(i => (
                                                    <input 
                                                        key={i}
                                                        type="number"
                                                        value={(skinfolds as any)[fold.id][i]}
                                                        onChange={(e) => handleSkinfoldChange(fold.id as keyof typeof skinfolds, i, e.target.value)}
                                                        className={`w-full max-w-[60px] text-center px-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                                            isClinical 
                                                                ? 'bg-white border border-slate-200' 
                                                                : 'bg-zinc-950 border border-zinc-800 text-white'
                                                        }`}
                                                        placeholder={`#${i+1}`}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex flex-col items-end w-16">
                                                <span className={`text-[10px] uppercase font-bold ${isClinical ? 'text-slate-400' : 'text-zinc-500'}`}>Mediana</span>
                                                <span className={`text-sm font-black ${isClinical ? 'text-indigo-600' : 'text-indigo-400'}`}>
                                                    {fold.id === 'tricep' ? tricepMedian : fold.id === 'bicep' ? bicepMedian : fold.id === 'subscapular' ? subscapularMedian : suprailiacMedian}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className={`mt-4 p-4 rounded-xl border flex items-center justify-between ${isClinical ? 'bg-slate-900 text-white border-slate-800' : 'bg-zinc-900 border-zinc-800'}`}>
                                    <div>
                                        <p className="text-xs font-bold text-zinc-400">Grasa Corporal (Durnin-Womersley)</p>
                                        <p className="text-3xl font-black text-emerald-400">{bodyFat}%</p>
                                    </div>
                                    <Calculator className="text-zinc-600 w-10 h-10" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`p-6 border-t flex justify-end gap-3 ${isClinical ? 'border-slate-200 bg-slate-50' : 'border-zinc-800 bg-zinc-900/50'}`}>
                        <button
                            onClick={onClose}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                                isClinical ? 'text-slate-600 hover:bg-slate-200' : 'text-zinc-400 hover:bg-zinc-800'
                            }`}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 ${
                                isClinical ? 'bg-indigo-600 text-white shadow-md' : 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                            }`}
                        >
                            <Check size={16} /> Guardar Medición
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, MessageSquare, Filter, ChevronRight, Activity, Clock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const MOCK_VALIDATIONS = [
    {
        id: 'v1',
        patientName: 'Ana Gomez',
        time: 'Hace 10 min',
        type: 'photo',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop',
        aiAnalysis: 'Bowl Mediterráneo. Macros estimados: 450 kcal, 25g P, 40g C. Alineado con el plan (+95%).',
        status: 'pending'
    },
    {
        id: 'v2',
        patientName: 'Carlos Ruiz',
        time: 'Hace 1 hora',
        type: 'voice',
        text: '"Profe, no aguanté y me comí 3 empanadas fritas al mediodía porque no tuve tiempo de cocinar."',
        aiAnalysis: 'Transgresión detectada (+800 kcal). Se sugiere reajuste automático de cena (GPS Metabólico).',
        status: 'pending'
    },
    {
        id: 'v3',
        patientName: 'Sofia R.',
        time: 'Hace 2 horas',
        type: 'photo',
        image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&h=500&fit=crop',
        aiAnalysis: 'Ensalada verde con pollo. Macros estimados: 300 kcal. Volumen bajo, riesgo de hambre nocturna.',
        status: 'pending'
    }
];

export const ValidationTinderTab: React.FC = () => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';
    
    const [queue, setQueue] = useState(MOCK_VALIDATIONS);
    const [swiped, setSwiped] = useState<string[]>([]);

    const handleSwipe = (id: string, action: 'approve' | 'adjust') => {
        setSwiped([...swiped, id]);
        setTimeout(() => {
            setQueue(queue.filter(item => item.id !== id));
        }, 300);
    };

    if (queue.length === 0) {
        return (
            <div className={`h-[600px] flex flex-col items-center justify-center rounded-3xl border border-dashed ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                <Check className="w-16 h-16 text-emerald-500 mb-4 opacity-50" />
                <h3 className="text-2xl font-bold mb-2">Bandeja Limpia (Inbox Zero)</h3>
                <p className={`max-w-sm text-center ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Has procesado todas las confesiones. Excelente trabajo aplicando Gestión por Excepción.</p>
                <button onClick={() => setQueue(MOCK_VALIDATIONS)} className={`mt-6 text-sm font-bold hover:underline ${isClinical ? 'text-indigo-600' : 'text-indigo-400'}`}>Recargar Mocks</button>
            </div>
        );
    }

    const currentItem = queue[0];

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-[700px]">
            
            {/* Left Sidebar: Inbox List (Batch Context) */}
            <aside className={`w-full lg:w-80 rounded-3xl flex flex-col border shadow-xl ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                <div className={`p-4 border-b flex items-center justify-between ${isClinical ? 'border-slate-100' : 'border-zinc-800'}`}>
                    <h3 className="font-bold text-sm lg:text-base">Cola de Procesamiento</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${isClinical ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-950 text-indigo-300 border border-indigo-900'}`}>{queue.length} pendientes</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {queue.map((item, idx) => (
                        <div key={item.id} className={`p-3 rounded-xl flex items-center justify-between transition-all ${
                            idx === 0 
                                ? (isClinical ? 'bg-indigo-50 border border-indigo-100' : 'bg-indigo-900/20 border border-indigo-500/30') 
                                : (isClinical ? 'hover:bg-slate-50' : 'hover:bg-zinc-800')
                        }`}>
                            <div>
                                <div className="font-bold text-sm">{item.patientName}</div>
                                <div className={`text-[10px] flex items-center gap-1 mt-0.5 ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}><Clock size={10} /> {item.time}</div>
                            </div>
                            <ChevronRight size={14} className="opacity-30" />
                        </div>
                    ))}
                </div>
            </aside>

            {/* Right Area: Tinder Card */}
            <main className="flex-1 relative flex items-center justify-center">
                <AnimatePresence>
                    {currentItem && (
                        <motion.div 
                            key={currentItem.id}
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, x: -100 }}
                            transition={{ duration: 0.2 }}
                            className={`w-full max-w-md rounded-[2.5rem] shadow-2xl border overflow-hidden flex flex-col ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}
                        >
                            {/* Card Header */}
                            <div className={`p-6 pb-4 border-b flex justify-between items-center ${isClinical ? 'bg-slate-50 border-slate-100' : 'bg-zinc-900/50 border-zinc-800'}`}>
                                <div>
                                    <h3 className={`font-black text-xl ${isClinical ? 'text-slate-900' : 'text-zinc-100'}`}>{currentItem.patientName}</h3>
                                    <span className={`text-xs font-bold uppercase tracking-widest ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>{currentItem.type === 'photo' ? 'Registro Fotográfico' : 'Confesión de Voz'}</span>
                                </div>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${isClinical ? 'bg-slate-200 text-slate-600' : 'bg-zinc-800 text-zinc-300'}`}>
                                    {currentItem.patientName.charAt(0)}
                                </div>
                            </div>

                            {/* Card Media */}
                            <div className={`min-h-[250px] flex items-center justify-center p-6 relative ${isClinical ? 'bg-slate-100' : 'bg-zinc-950'}`}>
                                {currentItem.type === 'photo' ? (
                                    <img src={currentItem.image} alt="Meal" className="w-full h-64 object-cover rounded-2xl shadow-inner" />
                                ) : (
                                    <div className={`border p-6 rounded-3xl w-full ${isClinical ? 'bg-indigo-50 border-indigo-100 text-indigo-950' : 'bg-indigo-950/20 border-indigo-900/50 text-indigo-200'}`}>
                                        <MessageSquare className={`mb-4 ${isClinical ? 'text-indigo-500' : 'text-indigo-400'}`} size={32} />
                                        <p className="font-medium text-lg leading-relaxed italic">
                                            {currentItem.text}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* AI Analysis */}
                            <div className={`p-6 border-t ${isClinical ? 'bg-white border-slate-100' : 'bg-zinc-900 border-zinc-800'}`}>
                                <div className={`flex items-center gap-2 mb-2 ${isClinical ? 'text-indigo-600' : 'text-indigo-400'}`}>
                                    <Activity size={16} />
                                    <span className="text-xs font-bold uppercase tracking-widest">IA Scribe Analysis</span>
                                </div>
                                <p className={`text-sm leading-relaxed font-medium ${isClinical ? 'text-slate-700' : 'text-zinc-300'}`}>
                                    {currentItem.aiAnalysis}
                                </p>
                            </div>

                            {/* Actions (Tinder Swipe Controls) */}
                            <div className={`p-6 flex gap-4 ${isClinical ? 'bg-slate-50' : 'bg-zinc-900/30'}`}>
                                <button 
                                    onClick={() => handleSwipe(currentItem.id, 'adjust')}
                                    className={`flex-1 py-4 border-2 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                                        isClinical 
                                            ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800' 
                                            : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100'
                                    }`}
                                >
                                    <X size={20} /> Ajustar Nudge
                                </button>
                                <button 
                                    onClick={() => handleSwipe(currentItem.id, 'approve')}
                                    className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <Check size={20} /> Aprobar (Right)
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

        </div>
    );
};

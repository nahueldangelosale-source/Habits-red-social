import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, PenTool, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useExecutionStore } from '../../stores/useExecutionStore';

interface HybridCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    title: string;
    actionRoute: string;
  };
}

export const HybridCheckinModal: React.FC<HybridCheckinModalProps> = ({ isOpen, onClose, item }) => {
  const navigate = useNavigate();
  const [view, setView] = useState<'CHOICE' | 'MANUAL'>('CHOICE');
  const [rpe, setRpe] = useState(5);
  const [duration, setDuration] = useState(60);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const logManualSession = useExecutionStore(state => state.logManualSession);

  const tags = ["Falta de tiempo", "Entrené otro deporte", "Sin equipamiento", "Me sentí débil"];

  const toggleTag = (t: string) => {
    setSelectedTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const handleDeepLink = () => {
    onClose();
    navigate(item.actionRoute);
  };

  const handleSaveManual = () => {
    setIsSuccess(true);
    // Fire to global state
    const today = new Date().toISOString().split('T')[0];
    logManualSession(item.id, today, rpe, duration, selectedTags, note);

    setTimeout(() => {
      onClose();
      // reset state for next time after transition
      setTimeout(() => {
        setView('CHOICE');
        setIsSuccess(false);
      }, 300);
    }, 1500);
  };

  const getRpeColor = (val: number) => {
    if (val <= 3) return 'bg-emerald-400';
    if (val <= 6) return 'bg-amber-400';
    if (val <= 8) return 'bg-orange-500';
    return 'bg-rose-600';
  };

  const getRpeLabel = (val: number) => {
    if (val <= 3) return 'Paseo 🚶';
    if (val <= 6) return 'Moderado 🏃';
    if (val <= 8) return 'Desafiante 🏋️';
    if (val === 9) return 'Muy Duro 🥵';
    return 'Llegué al fallo 💀';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl flex flex-col h-[70vh] sm:h-auto"
          >
            <div className="absolute top-4 right-4 z-10">
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
                <X size={16} />
              </button>
            </div>

            {isSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-500 mb-6"
                >
                  <CheckCircle2 size={48} />
                </motion.div>
                <h2 className="text-2xl font-black font-montserrat text-slate-900 dark:text-white">Sesión Sellada</h2>
                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 font-lato">Tu coach ha sido notificado.</p>
              </div>
            ) : view === 'CHOICE' ? (
              <div className="flex-1 flex flex-col p-6">
                <h2 className="text-xl font-black font-montserrat text-slate-900 dark:text-white mb-2">{item.title}</h2>
                <p className="text-sm font-lato text-slate-500 dark:text-zinc-400 mb-8">¿Cómo quieres registrar esta sesión?</p>
                
                <div className="space-y-4 flex-1">
                  <button 
                    onClick={handleDeepLink}
                    className="w-full relative overflow-hidden group bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-2xl flex flex-col items-start gap-2 transition-transform active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white mb-2">
                      <Play size={20} className="ml-1" />
                    </div>
                    <span className="text-lg font-bold text-white font-montserrat">Iniciar Tracker</span>
                    <span className="text-xs text-indigo-100 font-lato text-left">Registro de alta fidelidad (Series, reps, descansos).</span>
                    
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform"></div>
                  </button>

                  <button 
                    onClick={() => setView('MANUAL')}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border-2 border-slate-200 dark:border-white/10 p-6 rounded-2xl flex flex-col items-start gap-2 hover:border-indigo-500/50 transition-all active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-slate-600 dark:text-zinc-300 mb-2">
                      <PenTool size={20} />
                    </div>
                    <span className="text-lg font-bold text-slate-900 dark:text-white font-montserrat">Registro Manual</span>
                    <span className="text-xs text-slate-500 dark:text-zinc-400 font-lato text-left">Resumen rápido de esfuerzo y duración. Mínima fricción.</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col p-6 overflow-y-auto hide-scrollbar">
                <button 
                  onClick={() => setView('CHOICE')}
                  className="text-xs font-bold text-indigo-500 mb-6 flex items-center gap-1 w-fit hover:text-indigo-600 transition-colors"
                >
                  ← Volver a opciones
                </button>
                <h2 className="text-xl font-black font-montserrat text-slate-900 dark:text-white mb-6">Proof of Work</h2>
                
                <div className="space-y-8 pb-10">
                  {/* RPE Slider */}
                  <div>
                    <div className="flex justify-between items-end mb-4">
                      <label className="text-sm font-bold text-slate-700 dark:text-zinc-300">Esfuerzo Percibido (RPE)</label>
                      <span className="text-xs font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-lg">
                        {getRpeLabel(rpe)}
                      </span>
                    </div>
                    <div className="relative h-2 bg-slate-100 dark:bg-zinc-800 rounded-full">
                      <div className={`absolute left-0 top-0 bottom-0 rounded-full ${getRpeColor(rpe)} transition-all duration-300`} style={{ width: `${(rpe/10)*100}%` }}></div>
                      <input 
                        type="range" min="1" max="10" step="1" 
                        value={rpe} onChange={(e) => setRpe(parseInt(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div 
                        className="absolute top-1/2 -mt-3 w-6 h-6 bg-white rounded-full shadow-md border-2 border-slate-200 pointer-events-none transition-all duration-300"
                        style={{ left: `calc(${(rpe/10)*100}% - 12px)`, borderColor: rpe > 7 ? '#f43f5e' : (rpe > 4 ? '#fbbf24' : '#34d399') }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400">
                      <span>1 (Paseo)</span>
                      <span>10 (Fallo)</span>
                    </div>
                  </div>

                  {/* Duration Delta */}
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-zinc-300 block mb-4">Duración Estimada</label>
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-zinc-800 rounded-2xl p-2 border border-slate-200 dark:border-white/10">
                      <button onClick={() => setDuration(Math.max(5, duration - 5))} className="w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 font-bold shadow-sm hover:text-indigo-500 transition-colors">-5</button>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black font-montserrat text-slate-900 dark:text-white">{duration}</span>
                        <span className="text-xs font-bold text-slate-500">min</span>
                      </div>
                      <button onClick={() => setDuration(duration + 5)} className="w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 font-bold shadow-sm hover:text-indigo-500 transition-colors">+5</button>
                    </div>
                  </div>

                  {/* Micro-Tags */}
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-zinc-300 block mb-3">Contexto de la Sesión</label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(t => (
                        <button 
                          key={t}
                          onClick={() => toggleTag(t)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                            selectedTags.includes(t) 
                              ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/20' 
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Note */}
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-zinc-300 block mb-3">¿Cómo te fue? (Opcional)</label>
                    <textarea 
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Deja una nota para tu coach..."
                      className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-sm font-lato text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none h-24"
                    />
                  </div>

                  <button 
                    onClick={handleSaveManual}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold font-montserrat py-4 rounded-2xl transition-colors shadow-lg shadow-indigo-500/20"
                  >
                    Sellar Sesión
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

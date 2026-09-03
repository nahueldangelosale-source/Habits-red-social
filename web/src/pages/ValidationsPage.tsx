import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { CheckCircle, XCircle, Play, Maximize2, User, Activity, AlertCircle } from 'lucide-react';

interface ValidationRequest {
  id: string;
  athleteName: string;
  athleteLevel: number;
  exercise: string;
  date: string;
  thumbnail: string;
  confidenceScore: number;
  aiNotes: string[];
}

const mockRequests: ValidationRequest[] = [
  {
    id: 'req-1',
    athleteName: 'Marcos Ruiz',
    athleteLevel: 14,
    exercise: 'Deadlift (140kg)',
    date: 'Hace 10 min',
    thumbnail: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop',
    confidenceScore: 92,
    aiNotes: ['Hip drive optimal', 'Spinal alignment neutral']
  },
  {
    id: 'req-2',
    athleteName: 'Sofia Viale',
    athleteLevel: 8,
    exercise: 'Snatch (45kg)',
    date: 'Hace 25 min',
    thumbnail: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=600&auto=format&fit=crop',
    confidenceScore: 68,
    aiNotes: ['Slight early arm bend', 'Catch position unstable']
  },
  {
    id: 'req-3',
    athleteName: 'Lucas Mendez',
    athleteLevel: 21,
    exercise: 'Back Squat (120kg)',
    date: 'Hace 1 hora',
    thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop',
    confidenceScore: 88,
    aiNotes: ['Depth achieved', 'Knee tracking stable']
  }
];

export const ValidationsPage: React.FC = () => {
    const { mode } = useTheme();
    const [requests, setRequests] = useState<ValidationRequest[]>(mockRequests);
    const [selectedRequest, setSelectedRequest] = useState<ValidationRequest | null>(null);

    const handleApprove = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setRequests(prev => prev.filter(r => r.id !== id));
        if (selectedRequest?.id === id) setSelectedRequest(null);
    };

    const handleReject = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setRequests(prev => prev.filter(r => r.id !== id));
        if (selectedRequest?.id === id) setSelectedRequest(null);
    };

    const isClinical = mode === 'CLINICAL';

    return (
        <div className={`min-h-screen pt-24 pb-20 px-6 ${isClinical ? 'bg-premium-clinical' : 'bg-premium-adrenaline'}`}>
            <div className="max-w-7xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-hero-title mb-2">Validaciones Pendientes</h1>
                    <p className={isClinical ? 'text-zinc-500' : 'text-zinc-400'}>
                        Revisión biomecánica y validación de técnicas. ({requests.length} pendientes)
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Inbox Panel */}
                    <div className="lg:col-span-1 space-y-4">
                        <AnimatePresence>
                            {requests.map(req => (
                                <motion.div 
                                    key={req.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -50, scale: 0.95 }}
                                    className={`
                                        cursor-pointer overflow-hidden
                                        ${isClinical ? 'glass-card-clinical glass-card-clinical-hover' : 'glass-card-adrenaline hover:-translate-y-1 hover:border-white/20'} 
                                        ${selectedRequest?.id === req.id ? (isClinical ? 'ring-2 ring-indigo-500' : 'ring-2 ring-emerald-500') : ''}
                                        rounded-xl transition-all duration-300
                                    `}
                                    onClick={() => setSelectedRequest(req)}
                                >
                                    <div className="flex p-4 gap-4">
                                        <div className="w-16 h-16 rounded-lg bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0 relative">
                                            <img src={req.thumbnail} alt={req.exercise} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                <Play className="w-6 h-6 text-white opacity-80" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{req.athleteName}</h3>
                                                <span className="text-xs text-zinc-500">{req.date}</span>
                                            </div>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">{req.exercise}</p>
                                            
                                            <div className="flex items-center gap-2">
                                                <div className={`text-xs px-2 py-0.5 rounded-full ${req.confidenceScore > 85 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                                                    AI Score: {req.confidenceScore}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`grid grid-cols-2 border-t ${isClinical ? 'border-slate-200' : 'border-zinc-800'}`}>
                                        <button 
                                            onClick={(e) => handleReject(req.id, e)}
                                            className="p-3 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                        >
                                            <XCircle className="w-4 h-4" /> Rechazar
                                        </button>
                                        <button 
                                            onClick={(e) => handleApprove(req.id, e)}
                                            className={`p-3 flex items-center justify-center gap-2 ${isClinical ? 'text-indigo-600 hover:bg-indigo-50' : 'text-emerald-500 hover:bg-emerald-500/10'} border-l ${isClinical ? 'border-slate-200' : 'border-zinc-800'} transition-colors`}
                                        >
                                            <CheckCircle className="w-4 h-4" /> Aprobar
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                            {requests.length === 0 && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={`p-8 text-center rounded-xl ${isClinical ? 'bg-slate-100 text-slate-500' : 'bg-zinc-900/50 text-zinc-500 border border-zinc-800'}`}
                                >
                                    <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No hay validaciones pendientes.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Viewer Panel */}
                    <div className="lg:col-span-2">
                        <AnimatePresence mode="wait">
                            {selectedRequest ? (
                                <motion.div
                                    key={selectedRequest.id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className={`bento-card ${isClinical ? 'glass-card-clinical' : 'glass-card-adrenaline'} h-[37.5rem] flex flex-col`}
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isClinical ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold">{selectedRequest.athleteName}</h2>
                                                <p className="text-sm text-zinc-500">Lvl {selectedRequest.athleteLevel} • {selectedRequest.exercise}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="btn btn-sm btn-ghost">
                                                <Maximize2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 bg-black rounded-xl overflow-hidden relative mb-6 group">
                                        <img src={selectedRequest.thumbnail} alt="Video Frame" className="w-full h-full object-cover opacity-60" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <button className="w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all transform hover:scale-110">
                                                <Play className="w-8 h-8 ml-1" />
                                            </button>
                                        </div>
                                        
                                        {/* Kinematic Overlay Mock */}
                                        <div className="absolute bottom-4 left-4 right-4 p-4 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="flex items-center gap-2 mb-2 text-white/90">
                                                <Activity className="w-4 h-4" /> <span className="text-xs font-mono">TRACKING KINEMATICS</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500 w-[45%]" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className={`p-4 rounded-xl ${isClinical ? 'bg-slate-50' : 'bg-zinc-800/50'}`}>
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">AI Analysis</h4>
                                            <ul className="space-y-2">
                                                {selectedRequest.aiNotes.map((note, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm">
                                                        <CheckCircle className={`w-4 h-4 mt-0.5 ${isClinical ? 'text-indigo-500' : 'text-emerald-500'}`} />
                                                        <span>{note}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className={`p-4 rounded-xl ${isClinical ? 'bg-slate-50' : 'bg-zinc-800/50'}`}>
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Biometrics</h4>
                                            <div className="space-y-3">
                                                <div>
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span>ROM (Range of Motion)</span>
                                                        <span className="font-mono">94%</span>
                                                    </div>
                                                    <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[94%]" /></div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span>Velocity</span>
                                                        <span className="font-mono">0.8 m/s</span>
                                                    </div>
                                                    <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[70%]" /></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-auto">
                                        <button 
                                            onClick={() => handleReject(selectedRequest.id)}
                                            className="btn btn-ghost"
                                        >
                                            Rechazar con Feedback
                                        </button>
                                        <button 
                                            onClick={() => handleApprove(selectedRequest.id)}
                                            className={`btn ${isClinical ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-black'}`}
                                        >
                                            Aprobar Técnica
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={`h-[37.5rem] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed ${isClinical ? 'border-slate-200 text-slate-400' : 'border-zinc-800 text-zinc-600'}`}
                                >
                                    <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
                                    <p className="text-lg">Selecciona un video para auditar</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ValidationsPage;
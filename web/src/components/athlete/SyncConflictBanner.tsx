import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConflictEvent {
    exercise_id: string;
    error: any;
}

export function SyncConflictBanner() {
    const [conflicts, setConflicts] = useState<ConflictEvent[]>([]);

    useEffect(() => {
        const handleConflict = (e: Event) => {
            const customEvent = e as CustomEvent<ConflictEvent>;
            setConflicts(prev => [...prev, customEvent.detail]);
        };

        window.addEventListener('SYNC_CONFLICT', handleConflict);
        return () => window.removeEventListener('SYNC_CONFLICT', handleConflict);
    }, []);

    const dismiss = (index: number) => {
        setConflicts(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-sm z-[150] flex flex-col gap-2 px-4 pointer-events-none">
            <AnimatePresence>
                {conflicts.map((conflict, i) => (
                    <motion.div
                        key={conflict.exercise_id + i}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="bg-red-500/90 backdrop-blur-md border border-red-400 text-white p-4 rounded-2xl flex items-start gap-3 shadow-2xl pointer-events-auto"
                    >
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-200" />
                        <div className="flex-1">
                            <h4 className="font-bold text-sm uppercase tracking-wider mb-1">Acción Requerida</h4>
                            <p className="text-xs text-red-100 leading-tight">
                                Una serie no pudo sincronizarse debido a una regla de negocio. (Revísalo con tu entrenador).
                            </p>
                        </div>
                        <button onClick={() => dismiss(i)} className="text-red-200 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

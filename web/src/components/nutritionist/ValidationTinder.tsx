import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Check, Bookmark, Sparkles, Utensils } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface MealCard {
    id: string;
    patientName: string;
    mealType: string;
    timeLogged: string;
    imageUrl: string;
    adherenceNote?: string;
}

export const ValidationTinder: React.FC = () => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    // Mock data
    const [cards, setCards] = useState<MealCard[]>([
        { id: '1', patientName: 'Sofía M.', mealType: 'Almuerzo Post-Entreno', timeLogged: '13:45', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800', adherenceNote: 'Cumplí con la proteína y vegetales.' },
        { id: '2', patientName: 'Carlos T.', mealType: 'Cena de Descanso', timeLogged: '20:30', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800' },
        { id: '3', patientName: 'Ana L.', mealType: 'Desayuno', timeLogged: '08:15', imageUrl: 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?auto=format&fit=crop&q=80&w=800', adherenceNote: 'Tuve un poco de hambre extra.' },
    ]);

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, cardId: string) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        if (offset > 100 || velocity > 500) {
            // Swipe Right (Aprobar)
            removeCard(cardId, 'APPROVED');
        } else if (offset < -100 || velocity < -500) {
            // Swipe Left (Para Revisión)
            removeCard(cardId, 'REVIEW');
        }
    };

    const removeCard = (id: string, action: 'APPROVED' | 'REVIEW') => {
        // En producción: Trigger Haptic Feedback (navigator.vibrate)
        if (action === 'APPROVED' && navigator.vibrate) navigator.vibrate(50);
        if (action === 'REVIEW' && navigator.vibrate) navigator.vibrate([50, 50]);

        setCards((prev) => prev.filter(c => c.id !== id));
    };

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${isClinical ? 'bg-[#f8fafc]' : 'bg-[#0a0a0a]'}`}>
            
            <div className="mb-10 text-center">
                <h2 className={`text-2xl font-black ${isClinical ? 'text-slate-900' : 'text-white'}`}>Flujo de Validación Asíncrona</h2>
                <p className={`text-sm mt-1 ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Diarios fotográficos pendientes.</p>
            </div>

            <div className="relative w-full max-w-sm h-[500px] flex items-center justify-center">
                <AnimatePresence>
                    {cards.length > 0 ? (
                        cards.map((card, index) => {
                            const isTop = index === cards.length - 1;
                            return (
                                <motion.div
                                    key={card.id}
                                    drag={isTop ? 'x' : false}
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.8}
                                    onDragEnd={isTop ? (e, info) => handleDragEnd(e, info, card.id) : undefined}
                                    initial={{ scale: 0.95, y: -20, opacity: 0 }}
                                    animate={{ 
                                        scale: isTop ? 1 : 0.95 - (cards.length - 1 - index) * 0.05, 
                                        y: isTop ? 0 : (cards.length - 1 - index) * -15,
                                        opacity: 1,
                                        zIndex: index
                                    }}
                                    exit={{ x: 300, opacity: 0, scale: 0.9 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className={`absolute w-full h-full rounded-3xl p-4 shadow-2xl flex flex-col justify-between cursor-grab active:cursor-grabbing border ${
                                        isClinical 
                                            ? 'bg-white border-slate-200' 
                                            : 'bg-zinc-900 border-zinc-800'
                                    }`}
                                >
                                    {/* Cabecera Polaroid */}
                                    <div className="flex justify-between items-center mb-4 px-2">
                                        <div>
                                            <h3 className={`font-bold ${isClinical ? 'text-slate-800' : 'text-white'}`}>{card.patientName}</h3>
                                            <span className={`text-xs ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>{card.timeLogged}</span>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                            isClinical ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-zinc-400'
                                        }`}>
                                            {card.mealType}
                                        </div>
                                    </div>

                                    {/* Foto Central */}
                                    <div className="flex-1 rounded-2xl overflow-hidden relative shadow-inner">
                                        <img src={card.imageUrl} alt="Meal" className="w-full h-full object-cover pointer-events-none" />
                                        
                                        {/* Overlay de instrucciones */}
                                        {isTop && (
                                            <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 hover:opacity-100 transition-opacity duration-300">
                                                <div className="bg-black/40 backdrop-blur-md rounded-full p-3 border border-white/10">
                                                    <Bookmark className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="bg-white/40 backdrop-blur-md rounded-full p-3 border border-white/10">
                                                    <Check className="w-6 h-6 text-slate-900" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Nota (si existe) */}
                                    <div className="h-16 mt-4 flex items-center justify-center px-2">
                                        {card.adherenceNote ? (
                                            <p className={`text-sm italic text-center font-medium ${isClinical ? 'text-slate-600' : 'text-zinc-400'}`}>
                                                "{card.adherenceNote}"
                                            </p>
                                        ) : (
                                            <p className={`text-sm italic text-center opacity-50 ${isClinical ? 'text-slate-400' : 'text-zinc-400'}`}>
                                                Sin comentarios adicionales.
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        // Inbox Zero - Empty State
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center text-center p-8 h-full"
                        >
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-inner ${
                                isClinical ? 'bg-emerald-50 border border-emerald-100' : 'bg-emerald-950/20 border border-emerald-900/30'
                            }`}>
                                <Sparkles className={`w-10 h-10 ${isClinical ? 'text-emerald-500' : 'text-emerald-400'}`} />
                            </div>
                            <h3 className={`text-2xl font-black mb-2 ${isClinical ? 'text-slate-800' : 'text-white'}`}>Bandeja Limpia</h3>
                            <p className={`text-sm leading-relaxed ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                                Has procesado todos los diarios fotográficos.<br/>Tus pacientes están en la ruta correcta.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Controles Táctiles Auxiliares (Opcionales, por si no quieren hacer swipe) */}
            {cards.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex gap-6 mt-10"
                >
                    <button 
                        onClick={() => removeCard(cards[cards.length - 1].id, 'REVIEW')}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-lg ${
                            isClinical ? 'bg-white text-slate-400 border border-slate-200' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                        }`}
                    >
                        <Bookmark className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={() => removeCard(cards[cards.length - 1].id, 'APPROVED')}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-lg ${
                            isClinical ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                    >
                        <Check className="w-6 h-6" />
                    </button>
                </motion.div>
            )}
        </div>
    );
};
